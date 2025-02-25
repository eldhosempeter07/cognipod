import { Timestamp } from "@firebase/firestore";
import { storage } from "./firebase/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import CryptoJS from "crypto-js";

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

export function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex !== -1 ? fileName.substring(dotIndex + 1) : ""; // Extracts after the last dot
}

export const checkIfExpired = (meetingDate: Date | Timestamp) => {
  let date: Date;

  if (meetingDate instanceof Timestamp) {
    date = meetingDate.toDate();
  } else {
    date = new Date(meetingDate);
  }

  const currentDate = new Date();
  return date < currentDate;
};

export const encryptData = (password: string) => {
  const data = { message: process.env.REACT_APP_FIREBASE_API_KEY };

  return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
};

export const decryptData = (
  encryptedData: string,
  password: string
): boolean => {
  try {
    if (!encryptedData || !password) {
      return false;
    }

    const bytes = CryptoJS.AES.decrypt(encryptedData, password);

    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      return false;
    }

    JSON.parse(decryptedString);

    return true;
  } catch (error) {
    return false;
  }
};

export const getTimeRemaining = (meetingDate: Date | Timestamp): string => {
  const now = new Date();
  const meetingTime =
    meetingDate instanceof Timestamp
      ? meetingDate.toDate()
      : new Date(meetingDate);

  const timeDifference = meetingTime.getTime() - now.getTime();

  if (timeDifference <= 0) {
    return "Session has started or already ended.";
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  if (days === 0 && hours === 0 && minutes < 10) {
    return `Session will start in ${minutes} minutes and ${seconds} seconds.`;
  }

  if (days > 0) {
    return `Session will start in ${days} days, ${hours} hours, and ${minutes} minutes.`;
  } else if (hours > 0) {
    return `Session will start in ${hours} hours and ${minutes} minutes.`;
  } else {
    return `Session will start in ${minutes} minutes.`;
  }
};
