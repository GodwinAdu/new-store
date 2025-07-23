
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import LoginForm from './_component/LoginForm'


const page = async() => {

  // await createStaff()
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-8 px-4">
        <div className="mx-auto grid  gap-6">
          <div className="grid gap-2 text-center ">
            <h1 className="text-3xl font-bold">Sign In </h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <LoginForm />
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline">
              Sign up
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
          src="/sales.jpg"
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
