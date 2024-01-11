import { useState, useCallback } from 'react';
import jsPlugin from 'js-plugin';
import _ from 'lodash';

// allow use hooks in ext points
// TODO: it always flatten items, which may not be what we want?
export default function useExtPoint(extPointName, extArgs) {
  const components = jsPlugin.invoke('!' + extPointName, extArgs);

  const [values, setValues] = useState([]);
  const handleCallback = useCallback(
    (value) => {
      setValues(_.flatten([...values, value]));
    },
    [values],
  );

  return {
    extNode: (
      <>
        {components.map((Comp, index) => {
          return <Comp key={index} callback={handleCallback} {...extArgs} />;
        })}
      </>
    ),
    values,
  };
}
