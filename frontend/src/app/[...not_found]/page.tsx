"use client";

import { notFound } from "next/navigation"

export default function ErrorPage() {
  notFound()

  return null
}