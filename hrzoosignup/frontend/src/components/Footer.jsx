import React from 'react'
import SrceBigLogo from '../assets/pravisrce.png';
import SrceLogoTiny from '../assets/srce-logo-e-mail-sig.png';
import { FormattedMessage } from 'react-intl';
import 'Styles/footer.css';
import { useIntl } from 'react-intl'


const Footer = () => {
  const intl = useIntl()

  return (
    <div id="hzsi-footer" className="shadow-sm align-self-center border rounded pristupacnost">
      {
        //<div className="text-center mt-2">
          //<Link to="/ui/izjava-pristupacnost">
            //Izjava o pristupačnosti
          //</Link>
        //</div>
      }
      <div className="text-center pt-2 mt-2 pb-2">
        <a href="https://www.srce.unizg.hr/" target="_blank" rel="noopener noreferrer">
          <img src={SrceLogoTiny} id="srcelogo" alt="SRCE Logo"/>
        </a>
      </div>
      <div className="text-center pt-1 pb-2">
        <p>
          <small>Copyright © 2024{' '}
            <a href={intl.formatMessage({
                defaultMessage: "https://www.srce.unizg.hr/",
                description: 'footer-link'
              })}
              target="_blank"
              style={{'textDecoration': 'none'}}
              rel="noopener noreferrer"
            >
              <FormattedMessage
                description="footer-srce"
                defaultMessage="Sveučilišni računski centar (Srce)"
              />
            </a>
          </small>
        </p>
      </div>
    </div>
  )
}

export default Footer
