import React from 'react'

function PromoterAuthLayout({ children, authentication = true }) {
  return (
    <div>{
      children
    }</div>
  )
}

export default PromoterAuthLayout