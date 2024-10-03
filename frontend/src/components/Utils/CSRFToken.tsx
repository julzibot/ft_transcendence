import { useState, useEffect } from "react";
import { API_URL } from "@/config";
import { get } from "http";

export default function CSRFToken() {
  const [csrftoken, setcsrftoken] = useState<string>('');

  const getCookie = (name: string) => {
    let cookieValue = '';

    if(document.cookie && document.cookie !== '') {
      let cookies = document.cookie.split(';');
      for(let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if(cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue
  }

  useEffect(() => {
    const fetchCSRFToken = async () => {
        await fetch(`${API_URL}/csrf-cookie/`,{
          method: 'GET',
          credentials: 'include',
        });
    }
    fetchCSRFToken()
    setcsrftoken(getCookie('csrftoken'));
  }, []);
  return(
    <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
  )
}