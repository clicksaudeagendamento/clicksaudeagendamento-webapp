
import { Helmet } from 'react-helmet-async';
import { useAppointments } from '@/contexts/AppointmentContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url
}: SEOProps) => {
  const { profile } = useAppointments();
  
  const defaultTitle = `${profile.name}`;
  const defaultDescription = `Agende sua consulta com ${profile.name}, ${profile.specialty} ${profile.register}. Sistema de agendamento online fácil e rápido. ${profile.address}`;
  const defaultKeywords = `${profile.specialty.toLowerCase()}, agendamento, consulta, ${profile.name.toLowerCase()}, médico, saúde, ${profile.register}`;
  const defaultImage = '/placeholder.svg';
  const defaultUrl = window.location.href;

  const seoTitle = title ? `${title} | ${profile.name}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image || defaultImage;
  const seoUrl = url || defaultUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={profile.name} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content={profile.primaryColor} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={profile.name} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seoUrl} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />
      
      {/* Additional SEO */}
      <meta name="google-site-verification" content="" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="São Paulo" />
      
      {/* Structured Data for Medical Professional */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalOrganization",
          "name": profile.name,
          "image": seoImage,
          "description": seoDescription,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": profile.address,
            "addressCountry": "BR"
          },
          "telephone": profile.phone,
          "medicalSpecialty": profile.specialty,
          "url": seoUrl,
          "sameAs": [],
          "potentialAction": {
            "@type": "ScheduleAction",
            "target": seoUrl,
            "name": "Agendar Consulta"
          }
        })}
      </script>
    </Helmet>
  );
};
