import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScrapperService {
  parseURL(url: string) {
    const baseURL = url.split('?')[0];
    const query = url.split('?')[1];
    const params_strings = query.split('&');
    let params: any = {};
    params_strings.forEach((p) => {
      params[p.split('=')[0]] = p.split('=')[1];
    });

    return {
      baseURL,
      params,
    };
  }

  getInitialParams(params: object, key: string) {
    return params[key];
  }

  async getData(
    url: string = '',
  ) {
    const browser = await puppeteer.launch({
      headless: false,
    });
    let parsedURL = this.parseURL(url);

    const tabs = [
      'summary',
      'details',
      'contacts',
      'dates',
      'constraints',
      'documents',
    ];

    let data: any = {};
    for (let i = 0; i < tabs.length; i++) {
      const perLink =
        parsedURL.baseURL +
        '?keyVal=' +
        parsedURL.params.keyVal +
        '&activeTab=' +
        tabs[i];

      const page = await browser.newPage();
      await page.goto(perLink, {
        waitUntil: 'networkidle2',
      });

      if (tabs[i] === 'summary') {
        data['summary'] = await page.evaluate(() => {
          const res = {};
          const summaryRows = document.querySelectorAll(
            '#simpleDetailsTable tr',
          );
          summaryRows.forEach((item) => {
            const label = item.querySelector('th').innerText.toLowerCase().replace(/\s/g, '_');
            if (label === 'application_received' || label === 'application_validated' || label === 'decision_issued_date') {
                res[label] = new Date(item.querySelector('td').innerText).toISOString();
            } else {
                res[label] = item.querySelector('td').innerText;
            }
          });
          return res;
        });
      } else if (tabs[i] === 'details') {
        data['details'] = await page.evaluate(() => {
          const res = {};
          const detailRows = document.querySelectorAll(
            '#applicationDetails tr',
          );
          detailRows.forEach((item) => {
            const label = item.querySelector('th').innerText.toLowerCase().replace(/\s/g, '_');
            res[label] = item.querySelector('td').innerText;
          });
          return res;
        });
      } else if (tabs[i] === 'contacts') {
        data['contacts'] = await page.evaluate(() => {
          const res: any = {
            agents: {},
            councilors: [],
          };
          const agentContainer = document.querySelector(
            '.tabcontainer div.agents',
          );
          res.agents.name = agentContainer.querySelector('p').innerText;
          const agentRows = agentContainer.querySelectorAll('table tr');
          agentRows.forEach((item) => {
            const label = item.querySelector('th').innerText.toLowerCase().replace(/\s/g, '_');
            res.agents[label] =
              item.querySelector('td').innerText;
          });
          const councilorsContainer = document.querySelector(
            '.tabcontainer div.councillors',
          );
          const councilors = councilorsContainer.querySelectorAll('p');
          councilors.forEach((c) => {
            const councilorData: any = {};
            councilorData.name = c.innerText;
            const councilorsRows =
              councilorsContainer.querySelectorAll('table tr');
            councilorsRows.forEach((item) => {
              const label = item.querySelector('th').innerText.toLowerCase().replace(/\s/g, '_');
              councilorData[label] = item.querySelector('td').innerText;
            });
            res.councilors.push(councilorData);
          });
          return res;
        });
      } else if (tabs[i] === 'dates') {
        data['dates'] = await page.evaluate(() => {
          const res = {};
          const datesRows = document.querySelectorAll('#simpleDetailsTable tr');
          datesRows.forEach((item) => {
            const label = item.querySelector('th').innerText.toLowerCase().replace(/\s/g, '_');
            res[label] = item.querySelector('td').innerText !== 'Not Available' ? new Date(item.querySelector('td').innerText).toISOString() : 'Not Available';
          });
          return res;
        });
      } else if (tabs[i] === 'constraints') {
        data['constraints'] = await page.evaluate(() => {
          const res: any = [];
          const datesRows = document.querySelectorAll(
            '#caseConstraints tr:not(:first-child)',
          );
          datesRows.forEach((item) => {
            res.push({
              name: item.querySelectorAll('td')[0].innerText,
              type: item.querySelectorAll('td')[1].innerText,
              status: item.querySelectorAll('td')[2].innerText,
            });
          });
          return res;
        });
      } else if (tabs[i] === 'documents') {
        data['documents'] = await page.evaluate(() => {
          let res: any = [];
          const datesRows = document.querySelectorAll(
            '#Documents tr:not(:first-child)',
          );
          datesRows.forEach((item) => {
            res.push({
              date: new Date(item.querySelectorAll('td')[1].innerText).toISOString(),
              type: item.querySelectorAll('td')[2].innerText,
              measure: item.querySelectorAll('td')[3].querySelector('a')?.href || '',
              drawing_number: item.querySelectorAll('td')[4].innerText,
              description: item.querySelectorAll('td')[5].innerText,
              url: item.querySelectorAll('td')[6].querySelector('a')?.href || '',
            });
          });
          return res;
        });
      }
    }

    await browser.close();

    return data;
  }
}
