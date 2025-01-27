import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-goodbye',
  template: `
    <div class="goodbye-container">
      <div class="goodbye-content">
        <div class="animation-container">
          <div class="wave-emoji">👋</div>
        </div>

        <h1>¡Hasta pronto!</h1>
        <p>Gracias por usar IziHabits. Esperamos verte de nuevo pronto.</p>
        <p class="subtitle">Tus datos han sido eliminados correctamente.</p>

        <a routerLink="/onboarding" class="start-again-btn">
          Comenzar de nuevo
        </a>
      </div>
    </div>
  `,
  styles: [
    `
    .goodbye-container
      min-height: 100vh
      min-height: 100dvh
      width: 100vw
      display: flex
      align-items: center
      justify-content: center
      background: linear-gradient(135deg, #7F56D9 0%, #9E77ED 100%)
      color: white
      padding: 24px
      text-align: center

    .goodbye-content
      max-width: 480px
      animation: fadeInUp 0.6s ease-out

    .animation-container
      margin-bottom: 32px

      .wave-emoji
        font-size: 64px
        animation: wave 1s ease-in-out infinite

    h1
      font-size: 36px
      font-weight: 600
      margin-bottom: 16px
      letter-spacing: -0.02em

    p
      font-size: 18px
      line-height: 1.6
      margin-bottom: 8px
      opacity: 0.9

    .subtitle
      font-size: 16px
      opacity: 0.7
      margin-bottom: 32px

    .start-again-btn
      display: inline-block
      padding: 16px 32px
      background: white
      color: #7F56D9
      border-radius: 12px
      font-weight: 600
      font-size: 16px
      text-decoration: none
      transition: all 0.3s ease
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
      
      &:hover
        transform: translateY(-2px)
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15)

    @keyframes fadeInUp
      from
        opacity: 0
        transform: translateY(20px)
      to
        opacity: 1
        transform: translateY(0)

    @keyframes wave
      0%, 100%
        transform: rotate(0deg)
      25%
        transform: rotate(-20deg)
      75%
        transform: rotate(20deg)
  `,
  ],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class GoodbyeComponent {}
