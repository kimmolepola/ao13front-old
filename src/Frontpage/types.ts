export enum ValidationState {
  OPEN, LOADING, SUCCESS
}

export type Validation = {
  dirty: boolean,
  state: ValidationState,
  login?: undefined | string,
  create?: undefined | string,
  request?: undefined | string,
  email?: undefined | string,
  username?: undefined | string,
  password?: undefined | string,
  repeatPassword?: undefined | string,
}
