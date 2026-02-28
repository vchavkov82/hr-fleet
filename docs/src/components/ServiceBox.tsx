import React from 'react';

interface ServiceBoxProps {
  title: string;
  description: string;
  href: string;
}

export const ServiceBox: React.FC<ServiceBoxProps> = ({ title, description, href }) => {
  return (
    <a href={href} className="service-box">
      <div className="service-box-content">
        <h3 className="service-box-title">{title}</h3>
        <p className="service-box-description">{description}</p>
      </div>
    </a>
  );
};