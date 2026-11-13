import { dispatch } from '../../server/http';
import '../../server/routes';

export const config = {
  api: { bodyParser: false, externalResolver: true },
};

export default function handler(req, res) {
  return dispatch(req, res);
}
