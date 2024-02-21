import Image from "next/image"
import Link from "next/link"

export default function Login() {
  return (
    <>
      <div className="row g-3 my-5 align-items-center justify-content-center">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-lg">
            <div className="card-header text-center border-0 text-dark mt-3">
              <h2 className="d-inline mx-3">Sign in with</h2>
              <Image
              src="/static/images/42.png"
              width={60}
              height={60}
              alt="42_logo"/>
            </div>
            <div className="card-body text-center">
              <button className="btn btn-dark">
              <Link className="text-decoration-none text-light" href="/api/auth/signin">Sign In</Link>                  
              </button>
              {/* <p className="card-text my-4"> or</p>
              <form>
                <div className="form-group">
                  <input type="text" className="form-control" id="username" placeholder="Username"/>
                </div>
                <div className="form-group my-1">
                  <input type="password" className="form-control" id="Password" placeholder="Password"/>
                </div>
                <button type="submit" className="btn btn-dark my-2">Submit</button>
              </form> */}
            </div>
          </div>
        </div>
      </div>
    </>)
}