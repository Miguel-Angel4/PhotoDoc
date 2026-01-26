import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Take Jobsite Photos,<br />
                        <span className="highlight">Done Right</span>
                    </h1>
                    <p className="hero-description">
                        The easiest way to document your projects. Organize photos, generate reports, and share with your team instantly.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary hero-btn">GET STARTED</button>
                    </div>
                </div>
                <div className="hero-visual">
                    {/* Detailed Phone Mockup */}
                    <div className="phone-mockup">
                        <div className="notch"></div>
                        <div className="screen">
                            <div className="app-bar">
                                <span>Photos</span>
                                <div className="app-bar-icons">
                                    <div className="icon"></div>
                                    <div className="icon"></div>
                                </div>
                            </div>
                            <div className="photo-grid">
                                {/* 4 folders/items */}
                                <div className="folder-item">
                                    <div className="folder-preview p1"></div>
                                    <div className="folder-name">Project A</div>
                                </div>
                                <div className="folder-item">
                                    <div className="folder-preview p2"></div>
                                    <div className="folder-name">Project B</div>
                                </div>
                                <div className="folder-item">
                                    <div className="folder-preview p3"></div>
                                    <div className="folder-name">Site 12</div>
                                </div>
                                <div className="folder-item">
                                    <div className="folder-preview p4"></div>
                                    <div className="folder-name">Renovation</div>
                                </div>
                            </div>
                            <div className="fab-button">+</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
