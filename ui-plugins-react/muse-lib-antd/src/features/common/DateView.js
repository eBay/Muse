import moment from 'moment';
// import PropTypes from 'prop-types';

export default function DateView({
  value,
  dateOnly = false,
  timeOnly = false,
  dateTime = true,
  dateFormat = 'YYYY-MM-DD',
  timeFormat = 'HH:mm:ss',
  dateTimeFormat = 'YYYY-MM-DD HH:mm:ss',
}) {
  if (!value) return null;
  const date = moment.isMoment(value) ? value : moment(value);

  let format = dateTimeFormat;
  if (dateOnly) format = dateFormat;
  if (timeOnly) format = timeFormat;
  return date.format(format);
}
