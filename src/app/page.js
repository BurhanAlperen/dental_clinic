'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Hero from '@/components/Hero/Hero';
import Services from '@/components/Services/Services';
import Gallery from '@/components/Gallery/Gallery';
import Doctors from '@/components/Doctors/Doctors';
import Reviews from '@/components/Reviews/Reviews';
import Location from '@/components/Location/Location';
import Footer from '@/components/Footer/Footer';
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal';
import MobileActionBar from '@/components/MobileActionBar/MobileActionBar';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Navbar onAppointmentClick={openModal} />

      <main>
        <Hero onAppointmentClick={openModal} />
        <Services />
        <Gallery />
        <Doctors onAppointmentClick={openModal} />
        <Reviews />
        <Location />
      </main>

      <Footer />
      <MobileActionBar onAppointmentClick={openModal} />
      <AppointmentModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
