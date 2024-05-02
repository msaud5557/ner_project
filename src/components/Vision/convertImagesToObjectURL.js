import axios from "axios";

const convertImagesToObjectURL = async (images, authToken) => {
  const convertedImages = [];

  for (const image of images) {
    try {
      const response = await axios.get(
        `http://135.181.6.243:9000/images/get/${image.id}/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        const blob = response.data;
        const objectURL = URL.createObjectURL(blob);
        convertedImages.push(objectURL);
      } else {
        console.error(`Failed to fetch image ${image.id}`);
      }
    } catch (error) {
      console.error("Error converting images to object URLs:", error);
    }
  }

  return convertedImages;
};

export default convertImagesToObjectURL;
