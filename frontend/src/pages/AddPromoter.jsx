import React from 'react'
import {
    PromoterForm,
    Header,
    Button,
} from '../components/index'

  
function AddPromoter() {
  return (
    <div className="p-8 pt-3">
      <Header />
      <PromoterForm />
      {/* <Button onClick={() => console.log("Clicked!")}>Save</Button> */}
    </div>
  )
}

export default AddPromoter