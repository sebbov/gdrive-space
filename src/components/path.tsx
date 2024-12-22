import React from "react";

interface PathProps {
    value: string[];
}

const Path: React.FC<PathProps> = ({ value }) => {
    return (
        <div className="flex items-center whitespace-nowrap overflow-hidden w-full">
            {value.map((component, index) => (
                <React.Fragment key={index}>
                    {index !== 0 && (
                        <span className="p-2 text-1xl font-bold text-blue-600 select-none">/</span>
                    )}
                    <span
                        className={`${index === value.length - 1
                            ? "p-2 text-2xl font-bold text-blue-600"
                            : "p-2 text-1xl font-bold text-blue-600"
                            } cursor-pointer`}
                        onClick={() => console.log(`Clicked: ${component} ${index}`)}
                        onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                        {component}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
};

export default Path;
