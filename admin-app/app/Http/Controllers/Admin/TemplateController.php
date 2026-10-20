<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Template::query();

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('category', 'like', $search)
                  ->orWhere('description', 'like', $search);
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        $templates = $query->orderBy('order', 'asc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total'       => Template::count(),
            'active'      => Template::where('is_active', true)->count(),
            'total_uses'  => Template::sum('use_count'),
            'total_views' => Template::sum('views_count'),
        ];

        $categories = Template::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category');

        return Inertia::render('Templates/Index', [
            'templates'  => $templates,
            'stats'      => $stats,
            'categories' => $categories,
            'filters'    => $request->only('search', 'category'),
            'admin'      => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'category'      => 'required|string|max:100',
            'thumbnail_url' => 'required|string',
            'video_url'     => 'required|string',
            'capcut_url'    => 'required|string|max:2000',
            'duration'      => 'nullable|string|max:20',
            'is_featured'   => 'nullable|boolean',
            'is_vn'         => 'nullable|boolean',
            'vn_image_url'  => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'order'         => 'nullable|integer',
            'tags'          => 'nullable',
        ]);

        $tags = [];
        if (!empty($validated['tags'])) {
            if (is_array($validated['tags'])) {
                $tags = $validated['tags'];
            } else {
                $tags = array_map('trim', explode(',', $validated['tags']));
            }
        }

        Template::create([
            'title'         => $validated['title'],
            'description'   => $validated['description'] ?? null,
            'category'      => $validated['category'],
            'thumbnail_url' => $validated['thumbnail_url'],
            'video_url'     => $validated['video_url'],
            'capcut_url'    => $validated['capcut_url'],
            'duration'      => $validated['duration'] ?: '0:15',
            'tags'          => $tags,
            'is_featured'   => (bool) ($validated['is_featured'] ?? false),
            'is_vn'         => (bool) ($validated['is_vn'] ?? false),
            'vn_image_url'  => !empty($validated['is_vn']) ? ($validated['vn_image_url'] ?? null) : null,
            'is_active'     => (bool) ($validated['is_active'] ?? true),
            'order'         => (int) ($validated['order'] ?? 0),
        ]);

        return redirect()->route('admin.templates.index')->with('success', 'CapCut Video Template created successfully!');
    }

    public function update(Request $request, int $id)
    {
        $template = Template::findOrFail($id);

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'category'      => 'required|string|max:100',
            'thumbnail_url' => 'required|string',
            'video_url'     => 'required|string',
            'capcut_url'    => 'required|string|max:2000',
            'duration'      => 'nullable|string|max:20',
            'is_featured'   => 'nullable|boolean',
            'is_vn'         => 'nullable|boolean',
            'vn_image_url'  => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'order'         => 'nullable|integer',
            'tags'          => 'nullable',
        ]);

        $tags = [];
        if (!empty($validated['tags'])) {
            if (is_array($validated['tags'])) {
                $tags = $validated['tags'];
            } else {
                $tags = array_map('trim', explode(',', $validated['tags']));
            }
        }

        $template->update([
            'title'         => $validated['title'],
            'description'   => $validated['description'] ?? null,
            'category'      => $validated['category'],
            'thumbnail_url' => $validated['thumbnail_url'],
            'video_url'     => $validated['video_url'],
            'capcut_url'    => $validated['capcut_url'],
            'duration'      => $validated['duration'] ?: '0:15',
            'tags'          => $tags,
            'is_featured'   => (bool) ($validated['is_featured'] ?? false),
            'is_vn'         => (bool) ($validated['is_vn'] ?? false),
            'vn_image_url'  => !empty($validated['is_vn']) ? ($validated['vn_image_url'] ?? null) : null,
            'is_active'     => (bool) ($validated['is_active'] ?? true),
            'order'         => (int) ($validated['order'] ?? 0),
        ]);

        return redirect()->route('admin.templates.index')->with('success', 'Template updated successfully!');
    }

    public function toggle(int $id)
    {
        $template = Template::findOrFail($id);
        $template->is_active = !$template->is_active;
        $template->save();

        return back()->with('success', 'Template status updated!');
    }

    public function destroy(int $id)
    {
        $template = Template::findOrFail($id);
        $template->delete();

        return redirect()->route('admin.templates.index')->with('success', 'Template deleted successfully!');
    }

    public function uploadVideo(Request $request)
    {
        if (!$request->hasFile('video')) {
            return response()->json([
                'message' => 'No video file received. The file may exceed the server upload limit (post_max_size / upload_max_filesize).'
            ], 422);
        }

        $request->validate([
            'video' => [
                'required',
                'file',
                'max:153600', // max 150MB
                function ($attribute, $value, $fail) {
                    $validExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v', '3gp', 'ts', 'flv'];
                    $validMimes = [
                        'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo',
                        'video/x-matroska', 'video/ogg', 'video/3gpp', 'video/x-m4v',
                        'application/octet-stream'
                    ];

                    $ext = strtolower($value->getClientOriginalExtension());
                    $mime = $value->getMimeType();

                    if (!in_array($ext, $validExtensions) && !in_array($mime, $validMimes)) {
                        $fail("The video must be a valid video format: " . implode(', ', $validExtensions));
                    }
                },
            ],
        ]);

        try {
            $path = $request->file('video')->store('templates/videos', 'public');

            return response()->json([
                'url' => asset('storage/' . $path),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Video upload failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server failed to save uploaded video: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function uploadThumbnail(Request $request)
    {
        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:10240', // max 10MB
        ]);

        $path = $request->file('thumbnail')->store('templates/thumbnails', 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
        ]);
    }

    public function uploadVnImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:15360', // max 15MB
        ]);

        $path = $request->file('image')->store('templates/vn_images', 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
        ]);
    }
}
