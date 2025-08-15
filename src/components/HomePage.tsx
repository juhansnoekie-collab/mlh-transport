import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Shield, Star, Phone, Mail } from 'lucide-react';
import QuoteCalculator from './QuoteCalculator';

const HomePage: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState('4-ton');

  const vehicles = [
    {
      id: 'mini-van',
      name: 'Mini Van',
      image: '/api/placeholder/120/80',
      capacity: '1.5m³',
      weight: '500kg',
      price: 'R250',
      originalPrice: 'R300',
      description: 'Furniture, packed goods, handheld-goods, materials, packages'
    },
    {
      id: '1-ton',
      name: '1 Ton',
      image: '/api/placeholder/120/80',
      capacity: '3m³',
      weight: '1000kg',
      price: 'R350',
      originalPrice: 'R400',
      description: '1 bedroom household, handheld-goods, materials'
    },
    {
      id: '1.5-ton',
      name: '1.5 Ton',
      image: '/api/placeholder/120/80',
      capacity: '4.5m³',
      weight: '1500kg',
      price: 'R500',
      originalPrice: 'R550',
      description: '1 bedroom household, handheld-goods, materials'
    },
    {
      id: '4-ton',
      name: '4 Ton',
      image: '/api/placeholder/120/80',
      capacity: '12m³',
      weight: '4000kg',
      price: 'R900',
      originalPrice: 'R1050',
      description: '2 or 3 bedroom household, handheld-goods, construction materials. Event goods.',
      featured: true
    },
    {
      id: '8-ton',
      name: '8 Ton',
      image: '/api/placeholder/120/80',
      capacity: '24m³',
      weight: '8000kg',
      price: 'R1400',
      originalPrice: 'R1600',
      description: '3, 4 bedroom household, handheld-goods, construction materials'
    },
    {
      id: '16-ton',
      name: '16 Ton',
      image: '/api/placeholder/120/80',
      capacity: '48m³',
      weight: '16000kg',
      price: 'R1450',
      originalPrice: 'R1600',
      description: '4, 6 bedroom household, handheld-goods, construction materials'
    }
  ];

  const services = [
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: 'Goods Transportation',
      features: [
        'Deliver goods to your Customers, Warehouse, Shop and Home.',
        'Manufacturers, Retailers, Supply shops.',
        'Once-off, Short term and Long term transportation.'
      ]
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: 'Man and Van Services',
      features: [
        'Home and Office moves on demand.',
        'Furniture, Home Equipment, Personal goods.',
        'Get help to carry and deliver on time.'
      ]
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Schedule Trips',
      features: [
        'Schedule transportation for your goods.',
        'Trained and trusted drivers for long distance and short distance trips.',
        'Insured services 24/7 for the vehicle and goods in transit.'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Mr Andile Mahlangu',
      date: '20 March 2022',
      location: 'Johannesburg',
      rating: 5,
      text: 'I have found your site to be invaluable in not only the ease of ordering a truck from you, but also in understanding how much it will cost with different quotes.'
    },
    {
      name: 'Dr Grant du Plessis',
      date: '1 June 2022',
      location: 'Sandton',
      rating: 4,
      text: "I just recently had MLH Transport take care of my delivery and I couldn't be happier. It saved me so much time and stress not having to go anywhere myself. The customer service was fantastic and the driver was really polite."
    },
    {
      name: 'Mr Thabang Makwetla',
      date: '1 Feb 2022',
      location: 'Pretoria',
      rating: 5,
      text: 'I would like to say thanks for making my move so easy! I own a business in the city centre and needed to change premises. Your trucks were on time, and I appreciate all of your help.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MLH Transport</span>
          </div>
          <Button variant="default" size="lg">
            Quotation in 30 seconds
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            On demand transportation
          </h1>
          <div className="flex justify-center items-center space-x-4 mb-8">
            <div className="flex space-x-2">
              {vehicles.slice(0, 6).map((vehicle) => (
                <div key={vehicle.id} className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <Truck className="h-6 w-6 text-gray-600" />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">👷</span>
              </div>
              <img src="/api/placeholder/40/30" alt="South Africa Flag" className="w-10 h-6" />
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            Are you a truck owner? Register your vehicle on this link
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {service.icon}
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Selection & Quote Section */}
      <section className="py-16 bg-gray-50" id="quote">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get Free Quotations Below</h2>
          
          {/* Vehicle Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {vehicles.map((vehicle) => (
              <Card 
                key={vehicle.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedVehicle === vehicle.id ? 'ring-2 ring-primary' : ''
                } ${vehicle.featured ? 'ring-2 ring-orange-400' : ''}`}
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <div className="text-sm font-medium">{vehicle.name}</div>
                  <div className="w-16 h-12 mx-auto bg-gray-200 rounded flex items-center justify-center">
                    <Truck className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="text-xs text-muted-foreground">+</div>
                  <div className="w-8 h-8 mx-auto bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">👷</span>
                  </div>
                  <div className="text-xs text-muted-foreground">From</div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">{vehicle.price}</div>
                    <div className="text-xs text-muted-foreground line-through">{vehicle.originalPrice}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{vehicle.description}</div>
                  <Button size="sm" variant="outline" className="w-full">
                    select a body type
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quote Calculator */}
          <QuoteCalculator />
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Customer Reviews</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>📅 {testimonial.date}</span>
                      <span>📍 {testimonial.location}</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Where are we located?</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>We offer transportation services to all areas in South Africa.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>We offer you lower prices because our vehicles already operate in your pickup area.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Each order is tailored to the needs of your load.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Drivers, Vehicles and Bookings are managed by MLH Transport.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Drivers approve quotations and orders on the driver app.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="font-semibold">Trucks. Anytime. Quick.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img src="/api/placeholder/400/300" alt="South Africa Map" className="w-full h-64 object-cover rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="h-6 w-6" />
                <span className="text-xl font-bold">MLH Transport</span>
              </div>
              <p className="text-gray-400 mb-4">Software and Operations. Mastered!</p>
              <p className="text-sm text-gray-500">© 2025 MLH Transport. Pty Ltd. South Africa.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Book Regular Deliveries</a></li>
                <li><a href="#" className="hover:text-white">Book Once off Delivery</a></li>
                <li><a href="#" className="hover:text-white">Bakkie Hire</a></li>
                <li><a href="#" className="hover:text-white">Truck Hire</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms and Conditions</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+27 66 378 4460</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@mlhtransport.co.za</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;