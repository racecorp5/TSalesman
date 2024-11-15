using Google.OrTools.ConstraintSolver;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using System.IO;
using Newtonsoft.Json;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;

namespace TspFunctionNamespace
{
    public static class TspFunction
    {
        private static readonly HttpClient httpClient = new HttpClient();

        [FunctionName("TravelingSalesman")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req,
            ILogger log)
        {
            // Get cities coordinates from query or body (simplified example)
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            
            RequestData data;
            try
            {
                data = JsonConvert.DeserializeObject<RequestData>(requestBody) ?? new RequestData(new List<Location>());
            }
            catch (JsonException ex)
            {
                log.LogError($"Error parsing request body: {ex.Message}");
                return new BadRequestObjectResult("Invalid JSON format");
            }

            var citiesParam = data?.Cities;
            if (citiesParam == null || citiesParam.Count == 0)
            {
                log.LogError("No cities provided");
                return new BadRequestObjectResult("Please provide a list of cities");
            }

            var solution = await SolveTSP(citiesParam, log);

            return new OkObjectResult(solution);
        }

        static async Task<ShortestRouteResponse> SolveTSP(List<Location> locations, ILogger log)
        {
            // Create the distance matrix
            var distanceMatrix = await CreateDistanceMatrix(locations, log);
            // var distanceMatrix = CreateDistanceMatrixAlgo(locations);

            // Solve the TSP problem
            var (orderedIndices, totalDistance) = SolveTSPWithORTools(distanceMatrix, log);

            // Create the ordered cities list
            var orderedCities = new List<OrderedCity>();
            for (int i = 0; i < orderedIndices.Count; i++)
            {
                var index = orderedIndices[i];
                var city = locations[index].City;
                var lat = locations[index].Lat;
                var lng = locations[index].Lng;
                var distanceToLastPoint = i > 0 ? distanceMatrix[orderedIndices[i - 1]][index] : 0;
                orderedCities.Add(new OrderedCity(city, lat, lng, distanceToLastPoint));
            }
            
            return new ShortestRouteResponse(orderedCities, totalDistance);
        }

        static async Task<List<List<double>>> CreateDistanceMatrix(List<Location> locations, ILogger log)
        {
            var apiKey = Environment.GetEnvironmentVariable("GOOGLE_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                log.LogError("GOOGLE_API_KEY environment variable is not set.");
                throw new Exception("GOOGLE_API_KEY environment variable is not set.");
            }

            var origins = string.Join("|", locations.Select(loc => $"{loc.Lat},{loc.Lng}"));
            var destinations = origins;

            var url = $"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origins}&destinations={destinations}&key={apiKey}";

            var response = await httpClient.GetFromJsonAsync<GoogleDistanceMatrixResponse>(url);
            if (response == null || response.Rows == null)
            {
                log.LogError("Error fetching distance matrix from Google API");
                throw new Exception("Error fetching distance matrix from Google API");
            }

            var distanceMatrix = new List<List<double>>();
            foreach (var row in response.Rows)
            {
                List<double> distances = row.Elements.Select(e => (double)e.Distance.Value).ToList();
                distanceMatrix.Add(distances);
            }

            return distanceMatrix;
        }
        
        // static List<List<double>> CreateDistanceMatrixAlgo(List<Location> locations)
        // {
        //     var distanceMatrix = new List<List<double>>();
        //     foreach (var loc1 in locations)
        //     {
        //         var row = new List<double>();
        //         foreach (var loc2 in locations)
        //         {
        //             var distance = CalculateDistance(loc1, loc2);
        //             row.Add(distance);
        //         }
        //         distanceMatrix.Add(row);
        //     }
        //     return distanceMatrix;
        // }

        // static double CalculateDistance(Location loc1, Location loc2)
        // {
        //     // Use Haversine formula to calculate distance
        //     double R = 6371; // Radius of the earth in km
        //     double dLat = (loc2.Lat - loc1.Lat) * Math.PI / 180;
        //     double dLng = (loc2.Lng - loc1.Lng) * Math.PI / 180;
        //     double a =
        //         Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
        //         Math.Cos(loc1.Lat * Math.PI / 180) * Math.Cos(loc2.Lat * Math.PI / 180) *
        //         Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        //     double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        //     double distance = R * c; // Distance in km
        //     return distance;
        // }

        static private (List<int> orderedIndices, double totalDistance) SolveTSPWithORTools(List<List<double>> distanceMatrix, ILogger log)
        {
            // Create the routing index manager
            var manager = new RoutingIndexManager(distanceMatrix.Count, 1, 0);

            // Create Routing Model
            var routing = new RoutingModel(manager);

            // Create and register a transit callback
            long TransitCallback(long fromIndex, long toIndex)
            {
                var fromNode = manager.IndexToNode((int)fromIndex);
                var toNode = manager.IndexToNode((int)toIndex);
                return (long)(distanceMatrix[fromNode][toNode] * 1000); // Convert to meters
            }
            var transitCallbackIndex = routing.RegisterTransitCallback(new LongLongToLong(TransitCallback));

            // Define cost of each arc
            routing.SetArcCostEvaluatorOfAllVehicles(transitCallbackIndex);

            // Setting first solution heuristic
            var searchParameters = operations_research_constraint_solver.DefaultRoutingSearchParameters();
            searchParameters.FirstSolutionStrategy = FirstSolutionStrategy.Types.Value.PathCheapestArc;

            // Solve the problem
            var solution = routing.SolveWithParameters(searchParameters);

            if (solution != null)
            {
                // Get the route
                var index = routing.Start(0);
                var orderedIndices = new List<int>();
                while (!routing.IsEnd(index))
                {
                    orderedIndices.Add(manager.IndexToNode(index));
                    index = solution.Value(routing.NextVar(index));
                }
                orderedIndices.Add(manager.IndexToNode(index));
                var totalDistance = solution.ObjectiveValue() / 1000.0; // Convert back to km
                return (orderedIndices, totalDistance);
            }

            return (new List<int>(), 0);
        }
    }

    public record RequestData(List<Location> Cities);
    public record Location(double Lat, double Lng, string City);
    public record OrderedCity(string City, double Lat, double Lng, double DistanceToLastPoint);
    public record ShortestRouteResponse(List<OrderedCity> OrderedCities, double TotalDistance);

    public record GoogleDistanceMatrixResponse(List<Row> Rows);
    public record Row(List<Element> Elements);
    public record Element(Distance Distance);
    public record Distance(long Value);
}