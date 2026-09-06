<?php

namespace Tests\Feature;

use App\Models\Employer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_can_list_users_with_filters(): void
    {
        User::factory()->count(2)->create(['role' => 'employee']);
        User::factory()->create(['role' => 'employer', 'is_suspended' => true]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/users?role=employee');

        $response->assertOk()
            ->assertJsonCount(2, 'data.data');

        $suspendedResponse = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/users?status=suspended');

        $suspendedResponse->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.is_suspended', true);
    }

    public function test_admin_can_search_users_by_name_or_email(): void
    {
        User::factory()->create([
            'name' => 'Abel Tesfaye',
            'email' => 'abel@example.com',
            'role' => 'employee',
        ]);

        User::factory()->create([
            'name' => 'Sara Mekonnen',
            'email' => 'sara@example.com',
            'role' => 'employee',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/users?search=abel@example.com');

        $response->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.name', 'Abel Tesfaye');
    }

    public function test_admin_can_toggle_user_suspension(): void
    {
        $user = User::factory()->create([
            'role' => 'employee',
            'is_suspended' => false,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/users/{$user->id}/toggle-suspend");

        $response->assertOk()
            ->assertJsonPath('data.is_suspended', true);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_suspended' => true,
        ]);

        // Toggle back to active
        $response2 = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/users/{$user->id}/toggle-suspend");

        $response2->assertOk()
            ->assertJsonPath('data.is_suspended', false);
    }

    public function test_admin_cannot_suspend_themselves(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/users/{$this->admin->id}/toggle-suspend");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'You cannot suspend your own account');
    }

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->create(['role' => 'employee']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/users/{$user->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }

    public function test_non_admin_cannot_access_user_management(): void
    {
        $user = User::factory()->create(['role' => 'employee']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }
}
