import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config";
import Cookies from 'js-cookie'

export default function CSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string | undefined>(Cookies.get('csrftoken'));

  useEffect(() => {
    const fetchCSRFToken = async () => {
      await fetch(`${BACKEND_URL}/api/csrf-cookie/`, {
        method: 'GET',
        credentials: 'include',
      });
    }
    if (!csrfToken) {
      fetchCSRFToken()
      setCsrfToken(Cookies.get('csrftoken'))
    }
  }, []);
  return (
    <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
  )
}