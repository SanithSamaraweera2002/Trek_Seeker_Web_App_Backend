import axios from 'axios';
import City from '../models/citiesModel';
import Destination from '../models/destinationModel';

interface GenerateTripRequest {
  cityID: number;
  userInterests: string[];
  budget: number;
  startDate: string;
  endDate: string;
  travelerCategory: string;
  ageCategory: string;
  gender: string;
  nationality: string;
}

interface ItineraryItem {
  DayNumber: number;
  destinations: Array<{
    DestinationID: number;
    DestinationName: string;
    Latitude: string;
    Longitude: string;
    OrderNumber: number;
    TimeFrom: string;
    TimeTo: string;
  }>;
  message?: string;
}

// Mock ML Response
async function mockedItinerary(data: any): Promise<any> {
  return [
    {
      DayNumber: 1,
      destinations: [
        {
          DestinationName: 'Temple of the Sacred Tooth Relic',
          OrderNumber: 1,
          timeFrom: '09:00 AM',
          timeTo: '10:30 AM',
        },
        {
          DestinationName: 'Royal Botanical Gardens, Peradeniya',
          OrderNumber: 2,
          timeFrom: '11:00 AM',
          timeTo: '12:30 PM',
        },
      ],
    },
    {
      DayNumber: 2,
      destinations: [
        { DestinationName: 'Hanthana Mountain View Point', OrderNumber: 1, timeFrom: '08:00 AM', timeTo: '12:00 PM' },
        { DestinationName: 'Sandagiri Maha Seya', OrderNumber: 2, timeFrom: '12:30 PM', timeTo: '14:00 PM' },
      ],
    },
  ];
}

export const generateTrip = async (data: GenerateTripRequest) => {
  const { userInterests, cityID, budget, travelerCategory, startDate, endDate, ageCategory, gender, nationality } =
    data;

  const city = await City.findByPk(cityID);
  if (!city) {
    throw new Error('No Data Available on Selected City');
  }

  const tripDuration =
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const modelInput = {
    age_category: ageCategory,
    nationality: 'UK',
    gender: gender,
    interests: userInterests,
    city: city.CityName,
    traveler_category: travelerCategory,
    duration: tripDuration,
  };

  try {
    const response = await axios.post(`${process.env.PYTHON_APP_API_URL}/recommendations/`, modelInput, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const modelResponse = response.data;

    // Destination details
    const itineraries: ItineraryItem[] = await Promise.all(
      modelResponse.map(async (day: any) => {
        const dayDestinations = await Promise.all(
          day.destinations.map(async (destination: any) => {
            const destinationDetails = await Destination.findOne({
              where: { DestinationName: destination.destination },
            });
            if (!destinationDetails) {
              throw new Error(`Destination: ${destination.DestinationName} - Data not found`);
            }
            return {
              DestinationID: destinationDetails.DestinationID,
              DestinationName: destinationDetails.DestinationName,
              Description: destinationDetails.Description,
              Latitude: destinationDetails.Latitude,
              Longitude: destinationDetails.Longitude,
              Image: destinationDetails.Image,
              Rating: destinationDetails.Ratings,
              OrderNumber: destination.destinationOrder,
              TimeFrom: destination.timeFrom ?? '',
              TimeTo: destination.timeTo ?? '',
            };
          })
        );
        return {
          DayNumber: day.DayNumber,
          destinations: dayDestinations,
        };
      })
    );

    for (let i = 1; i <= tripDuration; i++) {
      if (!itineraries.find((itinerary) => itinerary.DayNumber === i)) {
        itineraries.push({
          DayNumber: i,
          destinations: [],
          message: `No itinerary data available for Day ${i}`,
        });
      }
    }

    // Response obj
    const tripGenerateResponse = {
      CityID: city.CityID,
      StartDate: startDate,
      EndDate: endDate,
      Duration: tripDuration,
      City: {
        CityName: city.CityName,
        CityDescription: city.CityDescription,
        CityImage: city.CityImage,
      },
      Itineraries: itineraries,
    };

    return tripGenerateResponse;
  } catch (error) {
    throw new Error('Failed to generate the trip. Please try again.');
  }
};
