

import React, { PureComponent } from 'react';
import { Result, Button } from 'antd';
import history from '../../common/history';




export default class PageNotFound extends PureComponent {
  render() {
    return (
      <div className="muse-antd_common-page-not-found">
        <Result
          status="404"
          title="404"
          subTitle={
            <div>
              <p>Sorry, the page you visited does not exist or you are not allowed to access it.</p>
              <p>
                If you have questions about it, please{' '}
                <a
                  href="https://jirap.corp.ebay.com/projects/ALTUSADMIN"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  contact Altus support
                </a>
                .
              </p>
            </div>
          }
          extra={
            <Button type="primary" onClick={() => history.push('/')}>
              Back Home
            </Button>
          }
        />
      </div>
    );
  }
}
