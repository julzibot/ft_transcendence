
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation";
import Image from "next/image"
import Link from "next/link"
import { useState, FormEvent } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import DOMPurify from 'dompurify'
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';

export default function SignIn() {
  const [data, setData] = useState({
    email:'',
    password:''
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null)

  async function loginUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const result = await signIn('credentials', {
      ...data,
      redirect: false
    })
    if(!result.ok)
      setError("Authentication failed, please check your credentials.")
    else
      router.push("/")
  }
  return (
    <>
      <div className="overflow-hidden position-fixed">
        <video className="object-fit-cover" src="/static/videos/background2.mp4" autoPlay loop muted />
      </div>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-50">
          <div className="card-header fs-2 fw-bold">Sign in to your account</div>
          <div className="card-body">
            <button className="btn btn-dark  fs-4 fw-bold"onClick={() => signIn('42-school', {
              redirect: true,
              callbackUrl: "/"
            })}>
            Sign in with
            <Image
                className="ms-1 me-1"
                src="/static/images/42.png"
                style={{filter: "invert(100%)"}}
                width={30}
                height={30}
                alt="42 Logo"
                fetchpriority="true"
              />
            </button>
            <p>Or</p>
            <form onSubmit={loginUser}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label" >Email or Username</label>
                <input type="text" id="text" className ="form-control" value={data.email} onChange={(e) => setData({...data, email:DOMPurify.sanitize(e.target.value)})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" value={data.password} onChange={(e) => setData({...data, password:DOMPurify.sanitize(e.target.value)})}/>
              </div>
              <div className="form-text text-danger">{error}</div>
              <button type="submit" className="btn btn-dark fw-bold">Submit</button>
            </form>
          </div>
          <div className="card-footer">Not Registered Yet ? 
            <Link className="text-decoration-none"href="/auth/register"> Register</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }
  return {
    props: {}
  };
};