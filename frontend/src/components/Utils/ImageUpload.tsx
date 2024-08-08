"use client";

import {useState, useEffect} from 'react'
import {useSession} from 'next-auth/react'
import { BASE_URL } from '@/utils/constants';
import {Upload} from 'react-bootstrap-icons'

export default function ImageUpload() {
    const {data: session, update} = useSession()
    const [file, setFile] = useState<File | null>(null)

		useEffect(() => {
			if(file)
				uploadImage()
		}, [file])

    async function uploadImage() {
        try {
            const formData = new FormData()
            formData.append('user_id', String(session?.user.id))
            if (file) {
                formData.append('image', file);
            }
            const response = await fetch(BASE_URL + 'update/image/', {
                method: 'PUT',
                body: formData
            })
            if(!response.ok)
                throw new Error("Failed to upload data, Try Again")
					update({image: file})
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