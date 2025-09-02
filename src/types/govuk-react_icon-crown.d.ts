declare module '@govuk-react/icon-crown' {
import * as React from 'react'

interface CrownProps extends React.SVGProps<SVGAElement> {
    height?: number;
    width?: number;
}

const crown: React.FC<CrownProps>;
export default crown;
}