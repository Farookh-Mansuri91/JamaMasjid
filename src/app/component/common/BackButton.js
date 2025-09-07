'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';

export default function BackButton() {
    const router = useRouter();

    return (
        <div className="d-flex justify-content-md-start justify-content-end mb-3">
            <Button
                variant="secondary"
                onClick={() => router.back()}
                className="rounded-pill shadow-sm px-4"
            >
                <FaArrowLeft className="me-2" /> Back
            </Button>
        </div>
    );
}
