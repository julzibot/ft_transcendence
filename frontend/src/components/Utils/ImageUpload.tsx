"use client";

import {useState, FormEvent, useEffect} from 'react'
import {getSession, useSession} from 'next-auth/react'
import { BASE_URL } from '@/utils/constants';
import {Upload} from 'react-bootstrap-icons'

export default function ImageUpload() {
    const {data: session, update} = useSession()
    const [file, setFiles] = useState(null)
    const [err, setErr] = useState('')
    const [url, setUrl] = useState('')
    const [sessionget, setSession] = useState({})
    const [loading, setLoading] = useState(false)

    async function uploadImage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (file) {
            try {
                setLoading(true)
                const formData = new FormData()
                formData.append('user_id', sessionget?.user?.id)
                formData.append('image', file)
                const response = await fetch(BASE_URL + 'update/image/', {
                    method: 'PUT',
                    body: formData
                })
                if(!response.ok) {
                    throw new Error("Failed to upload data, Try Again")
                }
                setLoading(false)
            }
            catch (error) {
                setLoading(false)
                console.error(error)
            }
            finally {
                update({image: file})
                setLoading(false)
            }
            setErr('')
        } else {
            setErr('Upload Image')
        }
    }   
    const handelUpload = (e) => {
        let file = e.target.files[0]
        const fileUrl = URL.createObjectURL(file)
        setUrl(fileUrl)
        setFiles(e.target.files[0])
        setErr('')
    }
    const removeFile = () => {
        setFiles(null)
        setUrl('')
    }
    
    const handleSession = async() => {
        let getSessions = await getSession()
        setSession(getSessions)
    }

    useEffect(() => {
      handleSession()
    },[])
    return (
        <>
            {/* <form onSubmit={(e) => uploadImage(e)}>
                <input className='ms-4 my-2' type="file" accept="image/*" required={true} value={file} onChange={(e) => setFile(e.target.files[0])}/>
                <br/>
                <button className="btn btn-dark ms-4 mb-2" type="submit">Upload</button>
                </form> */}
                <form onSubmit={(e) => uploadImage(e)} style={{width:'20%'}}>
                    { !file ?
                        <input className='ms-4 form-control' type="file" accept="image/*" required={true} onChange={(e) => handelUpload(e)}/> :
                    !loading ? <div>
                            <img src={url} style={{ width:'100px', height:'100px'}} className='ms-4 mb-2 me-2'/>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16" onClick={removeFile}>
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                        </div> :
                        <div className="spinner-border spinner-border-sm ms-4 mb-2" role="status">
                            <span className="sr-only"></span>
                        </div> 
                    }
                    {err && <p className='text-danger ms-4 mb-0'>{err}</p>}
                    <br/>
                    <button className="btn btn-dark ms-4 mb-2" type="submit">Upload</button>
                </form>
        </>
    )
}