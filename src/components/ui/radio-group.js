import React from "react";

const RadioGroupContext = React.createContext();

const RadioGroup = ({ children, value, onValueChange }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className="grid gap-2">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem = ({ value, id, ...props }) => {
  const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext);

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={selectedValue === value}
      onChange={() => onValueChange(value)}
      className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
      {...props}
    />
  );
};

export { RadioGroup, RadioGroupItem };
