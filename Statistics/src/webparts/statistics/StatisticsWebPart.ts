import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';


import Statistics from './components/Statistics';

export interface IStatisticsWebPartProps {
  description: string;
}

export default class StatisticsWebPart extends BaseClientSideWebPart<IStatisticsWebPartProps> {

  

  public render(): void {
    const element: React.ReactElement = React.createElement(
      Statistics,
  
    );

    ReactDom.render(element, this.domElement);
  }
 
}
