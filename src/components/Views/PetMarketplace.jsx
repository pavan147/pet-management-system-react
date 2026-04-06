import React, { useMemo, useState } from "react";
import "./PetMarketplace.css";

const accessoriesCatalog = [
  {
    id: 1,
    name: "Premium Leather Collar",
    category: "Collar",
    petType: "Dog",
    price: 899,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1601758123927-196f49f3f4f3?auto=format&fit=crop&w=900&q=80",
    description: "Soft inner lining with adjustable buckle for daily comfort.",
  },
  {
    id: 2,
    name: "Travel Water Bottle",
    category: "Travel",
    petType: "Dog",
    price: 549,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    description: "Leak-proof bottle with attached foldable drinking bowl.",
  },
  {
    id: 3,
    name: "Cat Scratching Tower",
    category: "Play",
    petType: "Cat",
    price: 1999,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
    description: "Multi-level scratch post with hanging toys and perch.",
  },
  {
    id: 4,
    name: "Orthopedic Pet Bed",
    category: "Sleep",
    petType: "Dog",
    price: 2599,
    inStock: false,
    image:
      "https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=900&q=80",
    description: "Memory foam support for senior pets and recovering joints.",
  },
  {
    id: 5,
    name: "Reflective Harness",
    category: "Harness",
    petType: "Dog",
    price: 1299,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
    description: "Night-safe harness with breathable padding and grip handle.",
  },
  {
    id: 6,
    name: "Feather Wand Combo",
    category: "Play",
    petType: "Cat",
    price: 399,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
    description: "Interactive toy set to keep indoor cats active and happy.",
  },
  {
    id: 7,
    name: "Portable Litter Box",
    category: "Travel",
    petType: "Cat",
    price: 999,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
    description: "Foldable design for clean and stress-free travel.",
  },
  {
    id: 8,
    name: "Stainless Steel Feeding Set",
    category: "Feeding",
    petType: "All Pets",
    price: 749,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=900&q=80",
    description: "Anti-skid bowls with spill guard base for cleaner feeding.",
  },
  {
    id: 9,
    name: "Nylon Walking Belt",
    category: "Belt",
    petType: "Dog",
    price: 699,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=900&q=80",
    description: "Durable daily-use belt with anti-slip grip and quick lock buckle.",
  },
  {
    id: 10,
    name: "Adult Dog Food - Chicken & Rice",
    category: "Nutrition",
    petType: "Dog",
    price: 1499,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1601758174624-7b0c9f9c2f56?auto=format&fit=crop&w=900&q=80",
    description: "Balanced dry food formula for healthy skin, coat, and digestion.",
  },
  {
    id: 11,
    name: "Puppy Starter Food Pack",
    category: "Nutrition",
    petType: "Dog",
    price: 1199,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1598137260972-6f0d0e1f2f57?auto=format&fit=crop&w=900&q=80",
    description: "High-protein starter mix to support growth and immunity in puppies.",
  },
  {
    id: 12,
    name: "Joint Support Supplement",
    category: "Supplement",
    petType: "Dog",
    price: 899,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?auto=format&fit=crop&w=900&q=80",
    description: "Vet-trusted glucosamine supplement for mobility and joint comfort.",
  },
  {
    id: 13,
    name: "Multivitamin Chew Bites",
    category: "Supplement",
    petType: "All Pets",
    price: 799,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
    description: "Daily vitamin chew bites for immunity, metabolism, and energy support.",
  },
  {
    id: 14,
    name: "Retractable Leash",
    category: "Belt",
    petType: "Dog",
    price: 999,
    inStock: false,
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80",
    description: "One-touch brake leash for controlled and comfortable walks.",
  },
];

const categories = ["All", "Collar", "Belt", "Harness", "Feeding", "Nutrition", "Supplement", "Travel", "Play", "Sleep"];

const PetMarketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredAccessories = useMemo(() => {
    return accessoriesCatalog.filter((item) => {
      const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
      const queryMatch = item.name.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [query, selectedCategory]);

  return (
    <div className="container-fluid mt-4 pb-5 marketplace-page">
      <div className="marketplace-hero rounded-4 p-4 p-md-5 mb-4 text-white">
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <p className="mb-2 marketplace-tag">PetCare Marketplace</p>
            <h2 className="fw-bold mb-2">Browse Accessories Before Your Hospital Visit</h2>
            <p className="mb-0 marketplace-subtext">
              Explore available pet accessories with sample pricing. Add your picks and buy them directly at the hospital front desk.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div className="marketplace-note d-inline-block text-start">
              <div className="fw-semibold">How buying works</div>
              <small>Online view only. Final billing and pickup happen during your hospital visit.</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
          <div className="d-flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`btn btn-sm ${selectedCategory === category ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="marketplace-search">
            <input
              type="text"
              className="form-control"
              placeholder="Search accessory"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredAccessories.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-warning mb-0">No accessories found for your filter.</div>
          </div>
        ) : (
          filteredAccessories.map((item) => (
            <div className="col-sm-6 col-lg-4" key={item.id}>
              <div className="card border-0 shadow-sm h-100 marketplace-card">
                <img src={item.image} alt={item.name} className="card-img-top marketplace-img" />
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <h5 className="card-title mb-0">{item.name}</h5>
                    <span className={`badge ${item.inStock ? "text-bg-success" : "text-bg-secondary"}`}>
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="mb-2 small text-muted">
                    <span className="me-2">{item.category}</span>
                    <span>• {item.petType}</span>
                  </div>
                  <p className="text-muted small mb-3">{item.description}</p>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary fs-5">Rs. {item.price}</span>
                    <button type="button" className="btn btn-outline-dark btn-sm" disabled={!item.inStock}>
                      Reserve for Visit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PetMarketplace;
