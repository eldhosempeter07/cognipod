import { storage } from "./firebase/firebase";
import { getDownloadURL, ref } from "firebase/storage";

export type ImageProps = {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
};

export const getImage = ({ imageUrl, setImageUrl, setLoading }: ImageProps) => {
  const imagePath = `gs://yumhub-d8edd.appspot.com/${imageUrl}`;

  if (imagePath) {
    const storageRef = ref(storage, imagePath); // Get a reference to the image in Firebase Storage

    // Get the download URL of the image
    getDownloadURL(storageRef)
      .then((url) => {
        setImageUrl(url); // Set the image URL in state
        setLoading(false); // Set loading to false once the image is fetched
      })
      .catch((error) => {
        console.error("Error fetching image URL: ", error);
        setLoading(false);
      });
  } else {
    setLoading(false);
  }
};
