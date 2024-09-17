import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? '';
const GOOGLE_PLACES_NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

const getNearByHotels = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(GOOGLE_PLACES_NEARBY_URL, {
      params: {
        location: `${latitude},${longitude}`,
        // radius: 10000,
        // type: 'hotel',
        key: GOOGLE_PLACES_API_KEY,
        rankby: 'distance',
        keyword: 'luxury hotel|five-star hotel|hotel',
      },
    });

    return response.data.results.map((hotel: any) => ({
      // name: hotel.name,
      // rating: hotel?.rating,
      priceLevel: hotel?.price_level,
      // address: hotel.vicinity,
      location: {
        lat: hotel.geometry.location.lat,
        lng: hotel.geometry.location.lng,
      },
      placeId: hotel.place_id,
    }));
  } catch (error) {
    console.error('Error fetching nearby hotels:', error);
    throw new Error('Error fetching nearby hotels');
  }
};

// Fetch hotel details
const getGooglePlaceDetails = async (placeId: string) => {
  try {
    const response = await axios.get(GOOGLE_PLACE_DETAILS_URL, {
      params: {
        place_id: placeId,
        fields:
          'name,rating,url,user_ratings_total,formatted_address,international_phone_number,editorial_summary,website,photos',
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    const placeDetails = response.data?.result;

    const photoReference =
      placeDetails.photos && placeDetails.photos.length > 0 ? placeDetails.photos[0]?.photo_reference : null;

    const photoUrl = photoReference
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
      : null;

    return {
      name: placeDetails.name,
      rating: placeDetails.rating,
      url: placeDetails.url,
      address: placeDetails.formatted_address,
      userRatingsTotal: placeDetails.user_ratings_total,
      phoneNumber: placeDetails.international_phone_number,
      website: placeDetails.website,
      // photos: placeDetails.photos ? placeDetails.photos.map((photo: any) => photo.photo_reference) : [],
      image: photoUrl,
      overview: placeDetails.editorial_summary?.overview,
    };
  } catch (error) {
    console.error('Error fetching Google Place details:', error);
    throw new Error('Error fetching Google Place details');
  }
};

const getHotelRecommendations = async (destinations: { latitude: number; longitude: number; day: number }[]) => {
  const results = await Promise.all(
    destinations.map(async (destination) => {
      const hotels = await getNearByHotels(destination.latitude, destination.longitude);
      const detailedHotels = await Promise.all(
        hotels.map(async (hotel: any) => {
          const details = await getGooglePlaceDetails(hotel.placeId);
          return {
            ...hotel,
            ...details,
          };
        })
      );

      // Sort by rating
      // const sortedHotels = detailedHotels.sort((a, b) => (b.details?.rating || 0) - (a.details?.rating || 0));

      const topHotels = detailedHotels.slice(0, 3);

      return {
        day: destination.day,
        hotels: topHotels,
      };
    })
  );

  return results;
};

export { getGooglePlaceDetails, getHotelRecommendations };
