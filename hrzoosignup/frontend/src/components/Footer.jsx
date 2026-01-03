import React, { useContext } from 'react'
import { IntlContext } from 'Components/IntlContextProvider';
import SrceLogoTiny from 'Assets/srce-logo-foot.png';
import SrceLogoFoot55 from 'Assets/srce-logo-foot-55.svg';
import SrceLogoFoot55En from 'Assets/srce-logo-foot-55-en.svg';
import { FormattedMessage } from 'react-intl';
import 'Styles/footer.css';
import { useIntl } from 'react-intl'


const Footer = () => {
  const intl = useIntl()
  const { locale, setLocale } = useContext(IntlContext)

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
          {
            locale === 'hr' ?
              <img src={SrceLogoFoot55} id="srcelogohr" alt="SRCE Logo HR" style={{ width: 200, height: "auto" }} />
            :
              <img src={SrceLogoFoot55En} id="srcelogohr" alt="SRCE Logo HR" style={{ width: 200, height: "auto" }} />
          }
        </a>
      </div>
      <div className="text-center pt-1 pb-2">
        <p>
          <small>Copyright © 2026{' '}
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
