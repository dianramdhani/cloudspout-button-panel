import React, { PureComponent } from 'react';
import { Button, IconName } from '@grafana/ui';
import { PanelProps } from '@grafana/data';
import { ButtonPanelOptions, ButtonPanelState } from 'types';

interface Props extends PanelProps<ButtonPanelOptions> {}

export class ButtonPanel extends PureComponent<Props, ButtonPanelState> {
  constructor(props: any) {
    super(props);
    this.init();
  }

  init() {
    this.state = {
      api_call: 'READY',
      response: '',
    };
  }

  render() {
    const { options } = this.props;

    const exeucte = () => {
      this.setState({ api_call: 'IN_PROGRESS' });
      console.log(options.method?.value, ' to ', options.url, ' with key as ', options.type?.value);

      const url = new URL(options.url);

      const requestHeaders: HeadersInit = new Headers();
      requestHeaders.set('Content-Type', 'application/json');
      requestHeaders.set('Accept', 'application/json');

      const fetchOpts: RequestInit = {
        method: options.method?.value, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: requestHeaders,
        redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      };

      if (options.type?.value === 'HEADER') {
        options.params.forEach(e => {
          requestHeaders.set(e[0], e[1]);
        });
      } else if (options.type?.value === 'QUERY') {
        options.params.forEach(e => {
          url.searchParams.append(e[0], e[1]);
        });
      } else {
        console.error('Unknown api key type', options.type);
      }

      fetch(url.toString(), fetchOpts)
        .then(response => {
          if (response.ok) {
            this.setState({
              api_call: 'SUCCESS',
              response: response.statusText,
            });
            console.log('Requeste successful: ', response);
          } else {
            console.log('Requeste failed: ', response);
            throw new Error(response.status + response.statusText);
          }
        })
        .catch(e => {
          this.setState({
            api_call: 'ERROR',
            response: e.message,
          });
          console.error('Request error: ', e);
        });
    };

    const apiStateIcon = (): IconName => {
      switch (this.state.api_call) {
        case 'IN_PROGRESS':
          return 'fa fa-spinner';
        case 'SUCCESS':
          return 'check';
        case 'ERROR':
          return 'exclamation-triangle';
        case 'READY':
        default:
          return 'cog';
      }
    };

    const apiStateClassName = () => {
      switch (this.state.api_call) {
        case 'IN_PROGRESS':
          return 'spinning';
        default:
          return '';
      }
    };
    const getOrientation = () => {
      switch (this.props.options.orientation.value) {
        case 'left':
          return 'left';
        case 'right':
          return 'right';
        case 'center':
        default:
          return 'center';
      }
    };

    return (
      <div className={getOrientation()}>
        <Button
          variant={this.props.options.variant?.value}
          title={this.state.response}
          size="lg"
          className={apiStateClassName()}
          icon={apiStateIcon()}
          onClick={exeucte}
        >
          {options.text}
        </Button>
      </div>
    );
  }
}
