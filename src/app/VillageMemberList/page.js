"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import VillageMember from '../component/MemberForm/VillageMember'
import { ToastContainer } from 'react-toastify';


const VillageMemberList = () => {
  return (
    <>    <ToastContainer /><VillageMember /></>
  )
}

export default VillageMemberList