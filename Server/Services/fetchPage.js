import axios from "axios";

export async function fetchPage(currentUrl) {
    
        const response = await axios.get(currentUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
          },
        });

        return response.data
}