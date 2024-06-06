export { default } from "next-auth/middleware" // secure the entire app for authentication

export const config = { matcher: ["/", "/game", "/dashboard", "/account", "/chat"] }