"use client";

import {useState, FormEvent} from 'react'
import {useSession} from 'next-auth/react'
import { BASE_URL } from '@/utils/constants';

export default function ImageUpload() {
    const {data: session, update} = useSession()
    const [file, setFile] = useState(null)

    async function uploadImage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        try {
            const formData = new FormData()
            formData.append('user_id', session.user.id)
            formData.append('image', file)
            const response = await fetch(BASE_URL + 'update/image/', {
                method: 'PUT',
                body: formData
            })
            if(!response.ok) {
                throw new Error("Failed to upload data, Try Again")
            }

        }
        catch (error) {
            console.error(error)
        }
        finally {
            update({image: file})
        }
    }

    return (
        <>
            <form onSubmit={(e) => uploadImage(e)}>
                <input type="file" accept="image/*" required={true} src={file} onChange={(e) => setFile(e.target.files[0])}/>
                <button className="btn btn-dark" type="submit">Upload</button>
            </form>
        </>
    )
}