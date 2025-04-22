import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const PasswordInput = ({ value, onChange, label, showStrength = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({
    score: 0,
    message: '',
    color: 'red'
  });

  useEffect(() => {
    if (showStrength && value) {
      checkPasswordStrength(value);
    }
  }, [value, showStrength]);

  const validatePassword = () => {
    const requirements = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    };

    const allRequirementsMet = Object.values(requirements).every(Boolean);
    
    if (!allRequirementsMet) {
      toast.warning('Please check the password requirements');
      return false;
    }
    return true;
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = 'red';

    // Check length
    if (password.length >= 8) score++;
    // Check for uppercase
    if (/[A-Z]/.test(password)) score++;
    // Check for lowercase
    if (/[a-z]/.test(password)) score++;
    // Check for numbers
    if (/[0-9]/.test(password)) score++;
    // Check for special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    // Set message and color based on score
    if (score === 0) {
      message = 'Very Weak';
      color = 'red';
    } else if (score <= 2) {
      message = 'Weak';
      color = 'orange';
    } else if (score <= 4) {
      message = 'Medium';
      color = 'yellow';
    } else {
      message = 'Strong';
      color = 'green';
    }

    setStrength({ score, message, color });
  };

  return (
    <div className="w-full">
      <p>{label}</p>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          className="border border-zinc-300 rounded w-full p-2 mt-1 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300`}
                style={{
                  width: `${(strength.score / 5) * 100}%`,
                  backgroundColor: strength.color
                }}
              />
            </div>
            <span className="text-xs" style={{ color: strength.color }}>
              {strength.message}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Password must contain:
            <ul className="list-disc list-inside">
              <li className={value.length >= 8 ? 'text-green-500' : 'text-red-500'}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(value) ? 'text-green-500' : 'text-red-500'}>
                At least 1 uppercase letter
              </li>
              <li className={/[a-z]/.test(value) ? 'text-green-500' : 'text-red-500'}>
                At least 1 lowercase letter
              </li>
              <li className={/[0-9]/.test(value) ? 'text-green-500' : 'text-red-500'}>
                At least 1 number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(value) ? 'text-green-500' : 'text-red-500'}>
                At least 1 special character
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput; 