// src/styles/reactSelectStyles.js

export const getCustomSelectStyles = (isDark = false) => ({
    control: (provided, state) => ({
        ...provided,
        backgroundColor: isDark ? '#1f2937' : '#ffffff', // dark: gray-800, light: white
        borderColor: isDark ? '#374151' : '#d1d5db',
        color: isDark ? '#f9fafb' : '#111827',
        boxShadow: state.isFocused ? (isDark ? '0 0 0 1px #3b82f6' : '0 0 0 1px #2563eb') : 'none',
        '&:hover': {
            borderColor: isDark ? '#4b5563' : '#9ca3af',
        },
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f9fafb' : '#111827',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? (isDark ? '#3b82f6' : '#2563eb')
            : state.isFocused
                ? (isDark ? '#374151' : '#f3f4f6')
                : 'transparent',
        color: state.isSelected ? '#ffffff' : isDark ? '#f9fafb' : '#111827',
        cursor: 'pointer',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: isDark ? '#f9fafb' : '#111827',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: isDark ? '#f9fafb' : '#111827',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: isDark ? '#f9fafb' : '#6b7280',
        ':hover': {
            backgroundColor: isDark ? '#4b5563' : '#d1d5db',
            color: '#ef4444',
        },
    }),
});
