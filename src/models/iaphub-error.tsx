export default class IaphubError {

  public code: string;
  public message: string;
  public subcode?: string;
  public params?: { [key: string]: any };

  constructor({code, subcode, message, params}: {code: string, subcode?: string, message: string, params?: { [key: string]: any }}) {
    this.code = code;
    this.subcode = subcode;
    this.message = message;
    this.params = params;
  }

  static parse(err: any) {
    if (typeof err != 'object' || !err.message) {
      return new IaphubError({code: "unexpected", message: `${err}`})
    }

    var json = null;
    try {
      json = JSON.parse(err.message);
    }
    catch (err) {

    }

    if (json && json.code) {
      return new IaphubError({
        code: json.code,
        subcode: json.subcode,
        message: json.message,
        params: json.params
      })
    }

    return new IaphubError({code: "unexpected", message: `${err}`})
  }

}