import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SignupForm from './_components/SignupForm'

const page = () => {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-1">
        <div className="mx-auto grid gap-3 px-4">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up <span className='text-green-700 font-extrabold underline'>POS</span>ify</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to register your account
            </p>
          </div>
          <div>
            <SignupForm />
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline">
              Sign In
            </Link>
          </div>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/sign-up.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}

export default page
