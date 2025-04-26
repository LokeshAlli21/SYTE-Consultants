import React from 'react'

function Login() {
  return (
    <div className='w-full h-full flex flex-row items-center justify-around gap-0 p-0 bg-white'>
  <img className='w-1/2 object-cover h-full' src="../login-bg.png" alt="" />
  <div className="w-1/2 text-center min-h-screen flex items-center justify-center flex-col px-20 py-0">
  {/* Logo + Title */}
  <div className="flex items-center justify-start w-full font-inter font-semibold text-[32px] leading-[100%] tracking-[0] ">
    <img className="w-[100px]" src="../logo.png" alt="Logo" />
    <h2 className="ml-[-18px]">SYTE Consultants</h2>
  </div>

  {/* Login Card */}
  <div
    className="min-w-[550px] p-8 flex flex-col items-center justify-center gap-6 min-h-[500px] bg-white rounded-xl"
    style={{
      boxShadow: `
        0px 2px 2px 0px #00000040,
        0px 2px 2px 0px #00000040,
        0px 4px 4px 0px #00000040,
        inset 0px 2px 2px 0px #00000040
      `,
    }}
  >
    <h2 className="font-inter font-semibold text-[32px] leading-[100%] tracking-[0]">
      Welcome back!
    </h2>
    <p className="font-inter font-medium text-[20px] leading-[100%] tracking-[0]">
      Login to continue
    </p>

    {/* Email Input */}
    <input
      type="email"
      placeholder="Email"
      className="w-full h-[50px] px-4 border border-gray-300 rounded-md font-inter text-[16px] focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
    />

    {/* Password Input */}
    <input
      type="password"
      placeholder="Password"
      className="w-full h-[50px] px-4 border border-gray-300 rounded-md font-inter text-[16px] focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
    />

    {/* Forgot Password */}
    <div className="w-full text-left text-sm mt-[-10px]">
      <p className="font-inter text-gray-600">
        Forgot your password?{" "}
        <span className="text-[#5CAAAB] font-medium cursor-pointer hover:underline">
          Request
        </span>
      </p>
    </div>

    {/* Login Button */}
    <button
      className="w-full bg-gradient-to-b from-[#076666] to-[#5CAAAB] h-[50px] rounded-lg text-white font-semibold"
      type="submit"
    >
      Login
    </button>
  </div>
</div>

</div>
  )
}

export default Login