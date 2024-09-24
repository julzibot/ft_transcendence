"use client";

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/lib/AuthContext';
import { API_URL } from '@/config';
import { Upload } from 'react-bootstrap-icons'
import Cookies from 'js-cookie';

export default function ImageUpload() {
    const { session, update } = useAuth()
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        if (file)
            uploadImage()
    }, [file])

    async function uploadImage() {
        try {
            const formData = new FormData()
            formData.append('user_id', String(session?.user?.id))
            if (file) {
                formData.append('image', file);
            }
            await fetch(API_URL + '/update/image/', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken') as string
                },
                body: formData
            })
            update()
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <form className="position-absolute end-0 top-0 mt-4 me-5">
                <label htmlFor="file-upload" className="btn btn-dark rounded-circle">
                    <Upload />
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                            setFile(files[0] as File);
                        }
                    }}
                />
            </form>
        </>
    )
}