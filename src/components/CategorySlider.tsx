import { Apple, Baby, Box, Coffee, Cookie,  Flame,  Heart,  Home,  Milk, Wheat } from 'lucide-react'
import React from 'react'
import { motion } from 'motion/react'

function CategorySlider() {
    const categories=[
        {id:1, name:"Fruits & Vegetables", icons:Apple, color:"bg-green-100"},
        {id:2, name:"Dairy & Eggs",icon:Milk, color: "bg-yellow-100"},
        {id:3, name:"Rice, Atta & Grains", icon: Wheat, color: "bg-orange-100"},
        {id:4, name:"Snacks & Biscuits", icon: Cookie, color:"bg-pink-100"},
         {id:5, name:"Spices & Masalas", icon: Flame, color:"bg-red-100"},   
          {id:6, name:"Beverages & Drinks", icon: Coffee, color:"bg-blue-100"},
         {id:7, name:"Personal Care", icon: Heart, color:"bg-purple-100"}, 
         {id:8,name:"Household Essentials", icon: Home, color:"bg-lime-100"},
          {id:9, name:"Instant & Packaged Food", icon: Box, color:"bg-teal-100"},
           {id:10, name:"Baby & Pet Care", icon: Baby, color:"bg-rose-100"},
    ]

  return (
    <div>

    </div>
  )
}

export default CategorySlider