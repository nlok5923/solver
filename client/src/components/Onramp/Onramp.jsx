import { useState, useRef, useEffect } from 'react'
import { StripePack } from '@safe-global/onramp-kit'
// import { ethers } from 'ethers'

const OnrampComponent = (props) => {

    const [stripePack, setStripePack] = useState()

    useEffect(() => {

        ;(async () => {

            console.log(process.env.REACT_APP_STRIPE_PUBLIC_KEY)
            console.log( process.env.REACT_APP_STRIPE_SERVER_URL)
          
            const pack = new StripePack({
            stripePublicKey: 'pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3',
            // process.env.REACT_APP_STRIPE_PUBLIC_KEY,
            onRampBackendUrl: process.env.REACT_APP_STRIPE_SERVER_URL
          })
      
          await pack.init()
      
          setStripePack(pack)
          console.log('striupe pack set ', stripePack)
        })()
      }, [])

      useEffect(() => {
        (async () => {
            if(stripePack) {
            const sessionData = await stripePack.open({
                element: '#stripe-root',
                theme: 'light'
            })
            console.log('this is sessioon data', sessionData);
        }
        })()
      }, [props.openOnramp])


      return (
        <div>
            <div id="stripe-root"></div>
        </div>
      );

}

export default OnrampComponent;