import React, { useState } from 'react'
import {Button, InputField, H1, Radio, SearchBox, Select, TextArea, Checkbox, DateField, ErrorSummary, FileUpload, FormGroup, ListItem, GlobalStyle, GridCol, GridRow, H2, Paragraph, Panel, H3, RelatedItems, UnorderedList, SkipLink, LoadingBox, PhaseBanner, Breadcrumbs} from "govuk-react"
import { Link } from "react-router-dom";
// Removed duplicate import of Link

const Workbasket = () => (<main className="govuk-width-container">
  <GlobalStyle />
    <GridRow>
      <GridCol setWidth="two-thirds">
        <H1 className='govuk-heading-l'>Workbasket</H1>
      </GridCol>
      <GridCol setWidth="one-third" className="govuk-!-text-align-right">
            <Button
                as={Link}
                to="/network-operator-details"
            >
                Start new application
            </Button> 
      </GridCol>
    </GridRow>
        </main>
)
export default Workbasket
