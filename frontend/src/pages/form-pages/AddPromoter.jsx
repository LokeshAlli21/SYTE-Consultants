import React from 'react'
import {
    PromoterForm,
    Header,
    Button,
} from '../../components/index'
import { useParams } from 'react-router-dom'

  
function AddPromoter({viewOnly}) {
  const { id } = useParams()
  // alert(id? id: null)
  return (
    <div className="p-8 pt-3">
      <Header />
      <PromoterForm id={id? id: null} disabled={viewOnly}/>
      {/* <Button onClick={() => console.log("Clicked!")}>Save</Button> */}
    </div>
  )
}

export default AddPromoter